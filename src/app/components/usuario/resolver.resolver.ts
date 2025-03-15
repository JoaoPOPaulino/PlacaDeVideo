import { ResolveFn } from '@angular/router';

export const resolverResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
