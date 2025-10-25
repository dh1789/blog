/**
 * config 명령어: WordPress 연결 설정
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

export async function configCommand() {
  console.log(chalk.blue('\nWordPress 연결 설정\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'WordPress URL:',
      default: 'https://your-blog.com',
    },
    {
      type: 'input',
      name: 'username',
      message: 'WordPress 사용자명:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Application Password:',
      mask: '*',
    },
  ]);

  console.log(chalk.green('\n설정이 저장되었습니다.'));
  console.log(chalk.yellow('TODO: .env 파일에 저장 기능 구현 필요'));
}
