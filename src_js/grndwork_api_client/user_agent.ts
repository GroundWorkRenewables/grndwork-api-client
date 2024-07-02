import * as os from 'node:os';
import * as process from 'node:process';
import {version} from './version';

export function getUserAgent(): string {
  const client = `grndwork-api-client/${version}`;
  const runtime = `${process.release.name}/${process.version}`;
  const system = `${os.platform()}/${os.release()}`;
  const arch = os.machine();

  return `${client} (${runtime}; ${system}; ${arch})`;
}
