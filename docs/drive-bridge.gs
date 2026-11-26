/**
 * Drive bridge for the portfolio admin dashboard.
 *
 * Setup (once, signed in to a Google account that can edit the PORTFOLIO folder, ideally its owner):
 *   1. https://script.google.com -> New project. Replace the code with this file and save.
 *   2. Project Settings -> Script properties -> add SECRET with a long random value.
 *   3. Deploy -> New deployment -> Web app. Execute as: Me. Who has access: Anyone. Authorise.
 *   4. Copy the web app URL (ends in /exec) into the dashboard under "Drive", with the same SECRET.
 *
 * Every request must carry the secret, and only files inside the PORTFOLIO folder can be touched.
 * Deleted items go to the Drive trash, so they can be restored for 30 days.
 */
const ROOT_ID = '1JukKmoNxJxU6QkS-g1Zdgjg9suZklR54';
const IMAGE_TYPES = /^image\/(jpeg|png|webp|heic|heif)$/;

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    if (!secret || request.secret !== secret) return reply({ error: 'Wrong secret key.' });

    const actions = { ping: ping, list: list, ensure: ensure, upload: upload, rename: rename, trash: trash, trashFolder: trashFolder };
    if (!actions.hasOwnProperty(request.action)) return reply({ error: 'Unknown action.' });
    return reply(actions[request.action](request));
  } catch (error) {
    return reply({ error: String(error.message || error) });
  }
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/** Folder for a path like "nova-25" or "journal/my-post". Creates missing folders when asked to. */
function folderFor(path, create) {
  const parts = String(path || '').split('/');
  if (parts.length > 2 || !parts.every(function (p) { return /^[a-z0-9-]+$/.test(p); })) throw new Error('Invalid folder name.');
  let folder = DriveApp.getFolderById(ROOT_ID);
  for (let i = 0; i < parts.length; i++) {
    const found = folder.getFoldersByName(parts[i]);
    if (found.hasNext()) folder = found.next();
    else if (create) folder = folder.createFolder(parts[i]);
    else return null;
  }
  return folder;
}

function insideRoot(item) {
  let parents = item.getParents();
  for (let depth = 0; depth < 4 && parents.hasNext(); depth++) {
    const parent = parents.next();
    if (parent.getId() === ROOT_ID) return true;
    parents = parent.getParents();
  }
  return false;
}

function fileInRoot(id) {
  const file = DriveApp.getFileById(id);
  if (!insideRoot(file)) throw new Error('That file is not in the portfolio folder.');
  return file;
}

function ping() {
  return { ok: true, folder: DriveApp.getFolderById(ROOT_ID).getName() };
}

function list(request) {
  const folder = folderFor(request.path, false);
  const files = [];
  if (folder) {
    const all = folder.getFiles();
    while (all.hasNext()) {
      const file = all.next();
      if (IMAGE_TYPES.test(file.getMimeType()) && !file.isTrashed()) files.push({ id: file.getId(), name: file.getName() });
    }
  }
  files.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });
  return { files: files };
}

function ensure(request) {
  return { id: folderFor(request.path, true).getId() };
}

function upload(request) {
  if (!IMAGE_TYPES.test(request.mimeType)) throw new Error('Only photos can be uploaded.');
  const blob = Utilities.newBlob(Utilities.base64Decode(request.data), request.mimeType, String(request.name).replace(/[\/\\]/g, '-'));
  const file = folderFor(request.path, true).createFile(blob);
  return { id: file.getId(), name: file.getName() };
}

function rename(request) {
  request.renames.forEach(function (item) {
    fileInRoot(item.id).setName(String(item.name).replace(/[\/\\]/g, '-'));
  });
  return { ok: true };
}

function trash(request) {
  request.ids.forEach(function (id) { fileInRoot(id).setTrashed(true); });
  return { ok: true };
}

function trashFolder(request) {
  const folder = folderFor(request.path, false);
  if (folder && folder.getId() !== ROOT_ID && request.path !== 'journal') folder.setTrashed(true);
  return { ok: true };
}
