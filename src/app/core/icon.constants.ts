import { IconDefinition } from '@ant-design/icons-angular';
import { UserOutline } from '@ant-design/icons-angular/icons';

const zorroIcons: IconDefinition[] = [UserOutline];

const customIcons: IconDefinition[] = [
  {
    icon: '<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="22.5" stroke="currentColor" stroke-width="5"/></svg>',
    name: 'verity:circle',
  },
  {
    icon: '<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="45" height="45" stroke="currentColor" stroke-width="5"/></svg>',
    name: 'verity:square',
  },
  {
    icon: '<svg width="50" height="48" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.81514 45.5L25 5.54435L45.1849 45.5H4.81514Z" stroke="currentColor" stroke-width="5"/></svg>',
    name: 'verity:triangle',
  },
];

export const icons = [...zorroIcons, ...customIcons];
