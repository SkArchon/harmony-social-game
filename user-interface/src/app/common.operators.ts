import { Observable, throwError, timer } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';

export const timeBasedRetryStrategy = (maxRetryAttempts = 3, duration = 1000) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      // if maximum number of retries have been met, throw error
      if (retryAttempt > maxRetryAttempts) {
        return throwError(error);
      }
      return timer(duration);
    })
  );
};
