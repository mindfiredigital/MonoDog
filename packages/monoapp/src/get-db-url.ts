import { appConfig } from './config-loader';

function generateUrl() {
  const DATABASE_URL = `${appConfig.database.path}`;
  process.env.DATABASE_URL = DATABASE_URL;
  process.stdout.write(DATABASE_URL);
}

generateUrl();
