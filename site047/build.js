import { build } from 'vite';

try {
  const result = await build();
  console.log('BUILD_DONE_SUCCESSFULLY');
} catch (err) {
  console.error('BUILD_ERROR_STACK:', err);
  process.exit(1);
}
