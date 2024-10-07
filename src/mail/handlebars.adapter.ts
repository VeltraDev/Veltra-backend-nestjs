import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';

export class HandlebarsAdapter {
  compile(template: string, data: any): string {
    const templateFile = fs.readFileSync(
      join(__dirname, 'templates', template),
      'utf8',
    );
    const compiledTemplate = handlebars.compile(templateFile);
    return compiledTemplate(data);
  }
}
