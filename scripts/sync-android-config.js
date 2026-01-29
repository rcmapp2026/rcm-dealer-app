import fs from 'fs-extra';
import path from 'path';

const paths = {
  manifestSource: 'NativeResources/android/AndroidManifest.xml',
  manifestDest: 'android/app/src/main/AndroidManifest.xml',
  filePathsSource: 'NativeResources/android/file_paths.xml',
  filePathsDest: 'android/app/src/main/res/xml/file_paths.xml'
};

async function injectConfigs() {
  console.log('--- RCM NATIVE AUTO-SYNC PROTOCOL ---');
  try {
    if (!fs.existsSync('android')) {
      console.warn('Wait: "android" folder missing. Run "npx cap add android" first.');
      return;
    }
    await fs.ensureDir(path.dirname(paths.filePathsDest));
    if (fs.existsSync(paths.manifestSource)) {
      await fs.copy(paths.manifestSource, paths.manifestDest);
      console.log('INJECTED: AndroidManifest.xml');
    }
    if (fs.existsSync(paths.filePathsSource)) {
      await fs.copy(paths.filePathsSource, paths.filePathsDest);
      console.log('INJECTED: file_paths.xml');
    }
    console.log('--- SYNC COMPLETE ---');
  } catch (err) {
    console.error('SYNC ERROR:', err);
  }
}

injectConfigs();