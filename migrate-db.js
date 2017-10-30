const fs = require('fs-extra');
const path = require('path');

const dir = path.resolve(__dirname, 'dbs');

async function migrate(absFilePath) {
  return fs.readJson(absFilePath)
    .then(links => links.map(l => ({lien: l})))
    .then(linksTransformed => fs.writeJson(absFilePath, linksTransformed));
}

fs.readdir(dir)
  .then(files => {
    return Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(f => migrate(path.resolve(dir, f)))
    );
  })
  .then(() => console.log('Done'));
