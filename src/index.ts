import React from 'react';
import { Observable, Subject } from 'rxjs';

interface ISubjectStorage {
  [key: string]: Subject<any>;
}

class SubjectStorage {
  private subjects: ISubjectStorage;

  constructor() {
    this.subjects = {};
  }

  dispatch(topic: string, payload?: any) {
    if (this.subjects.hasOwnProperty(topic)) {
      this.subjects[topic].next(payload);
    }
  }

  getObservable(topic: string): Observable<any> {
    if (!this.subjects.hasOwnProperty(topic)) {
      this.subjects[topic] = new Subject();
    }
    return this.subjects[topic].asObservable();
  }

  // subscribe(topic: string, handler: any): Subscription {
  //   if (!this.subjects.hasOwnProperty(topic)) {
  //     this.subjects[topic] = new Subject();
  //   }
  //   return this.subjects[topic].subscribe(handler);
  // }

  unsubscribe(topic: string) {
    if (this.subjects.hasOwnProperty(topic)) {
      if (this.subjects[topic].observers.length === 0) {
        delete this.subjects[topic];
      }
    }
  }
}

const subjectStorage = new SubjectStorage();

export function useEvents(topic?: string, messageHandler?: any) {
  const eventHandler = messageHandler;
  const subscriptionTopic = topic;

  React.useEffect(() => {
    if (subscriptionTopic && eventHandler) {
      const subscription = subjectStorage.getObservable(subscriptionTopic).subscribe((payload?: any) => {
        eventHandler(payload);
      });

      return () => {
        subscription.unsubscribe();
        subjectStorage.unsubscribe(subscriptionTopic);
      };
    }
  }, [subscriptionTopic, eventHandler]);

  const dispatch = (dispatchTopic: string, payload?: any) => {
    if (dispatchTopic === undefined) {
      return;
    }
    subjectStorage.dispatch(dispatchTopic, payload);
  };

  return [dispatch];
}
