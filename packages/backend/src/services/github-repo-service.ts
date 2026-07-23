import { AppLogger } from '../middleware/logger';
import { makeGitHubRequest, requestOptions } from './github-actions-service';
import { randomUUID } from 'crypto';
import { GITHUB_REPO } from '../constants/features';

/**
 * Creates a Pull Request containing a newly generated .changeset file using the GitHub API
 */
export async function createChangesetPullRequest(
  owner: string,
  repo: string,
  packageName: string,
  changesetContent: string,
  accessToken: string
): Promise<{ success: boolean; message: string; prUrl?: string }> {
  try {
    const timestamp = Date.now();
    const branchName = `monodog/scheduled-release-${packageName.replace(/[^a-zA-Z0-9-]/g, '-')}-${timestamp}`;
    const commitMessage = `chore: scheduled release for ${packageName}`;
    AppLogger.info(
      `[GitHubRepoService] Starting PR creation for ${packageName} on ${owner}/${repo}`
    );

    // Get repository info to determine default branch
    const repoPath = GITHUB_REPO.REPOSITORY_ENDPOINT(owner, repo);
    const { data: repoData } = await makeGitHubRequest<any>(
      requestOptions('GET', repoPath, accessToken)
    );
    const baseBranch = repoData.default_branch || 'main';

    // Get the latest commit SHA of the base branch
    const refPath = GITHUB_REPO.REF_ENDPOINT(
      owner,
      repo,
      `heads/${baseBranch}`
    );
    const { data: refData } = await makeGitHubRequest<any>(
      requestOptions('GET', refPath, accessToken)
    );
    const baseSha = refData.object.sha;

    // Create a new branch pointing to the base branch SHA
    const createRefPath = GITHUB_REPO.REFS_ENDPOINT(owner, repo);
    const createRefPayload = JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });
    await makeGitHubRequest<any>(
      requestOptions('POST', createRefPath, accessToken, createRefPayload),
      createRefPayload
    );
    AppLogger.info(
      `[GitHubRepoService] Created branch ${branchName} from ${baseBranch}`
    );

    // Create the .changeset file on the new branch
    const randomHex = randomUUID().split('-')[0];
    const fileName = `.changeset/scheduled-${randomHex}.md`;
    const filePath = GITHUB_REPO.CONTENTS_ENDPOINT(owner, repo, fileName);
    const filePayload = JSON.stringify({
      message: commitMessage,
      content: Buffer.from(changesetContent).toString('base64'),
      branch: branchName,
    });
    await makeGitHubRequest<any>(
      requestOptions('PUT', filePath, accessToken, filePayload),
      filePayload
    );
    AppLogger.info(`[GitHubRepoService] Created changeset file ${fileName}`);

    // Open a Pull Request against the base branch
    const pullsPath = GITHUB_REPO.PULLS_ENDPOINT(owner, repo);
    const pullsPayload = JSON.stringify({
      title: `Scheduled Release: ${packageName}`,
      head: branchName,
      base: baseBranch,
      body: `This PR is automatically created by MonoDog for the scheduled release of \`${packageName}\`.\n\nMerge this PR to trigger the \`changesets/action\` workflow and publish the package.`,
    });
    const { data: prData } = await makeGitHubRequest<any>(
      requestOptions('POST', pullsPath, accessToken, pullsPayload),
      pullsPayload
    );

    AppLogger.info(
      `[GitHubRepoService] Successfully created PR: ${prData.html_url}`
    );

    return {
      success: true,
      message: `Successfully created PR for scheduled release`,
      prUrl: prData.html_url,
    };
  } catch (error) {
    AppLogger.error(
      `[GitHubRepoService] Failed to create changeset PR for ${packageName}: ${error}`
    );
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error creating PR',
    };
  }
}
