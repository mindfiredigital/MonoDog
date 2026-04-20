export const getConnectionPoints = (pkg, dep) => {
  const sourceX = dep.x + 50;
  const sourceY = dep.y + 25;
  let targetX = pkg.x + 50;
  let targetY = pkg.y + 25;

  if (sourceX < pkg.x) {
    targetX = pkg.x;
  } else if (sourceX > pkg.x + 100) {
    targetX = pkg.x + 100;
  } else if (sourceY < pkg.y) {
    targetY = pkg.y;
  } else {
    targetY = pkg.y + 50;
  }

  return { sourceX, sourceY, targetX, targetY };
};
