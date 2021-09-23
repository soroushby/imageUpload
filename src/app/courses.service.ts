import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { from, Observable } from 'rxjs';
import { Course } from './interfaces/course';

import { concatMap, map } from 'rxjs/operators';
import firebase from 'firebase/compat';
import { convertSnaps } from './db-util';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  // items: Observable<any[]> ;
  constructor(private db: AngularFirestore) {}

  addCourses(data1: any, data2: any, data3: any, data4: any) {
    this.db.collection('courses').add({
      data1: data1,
      data2: data2,
      data3: data3,
      data4: data4,
    });
  }

  // createCourse(newCourse: Partial<Course>, courseId?: string) {
  //   return this.db
  //     .collection('courses', (ref) => ref.orderBy('seqNo', 'desc').limit(1))
  //     .get()
  //     .pipe(
  //       concatMap((result) => {
  //         const courses = this.<Course>(result);
  //         const lastCourseSeqNo = courses[0]?.seqNo ?? 0;
  //         const course = {
  //           ...newCourse,
  //           seqNo: lastCourseSeqNo + 1,
  //         };
  //         let save$: Observable<any>;
  //         if (courseId) {
  //           save$ = from(this.db.doc(`courses/${courseId}`).set(course));
  //         } else {
  //           save$ = from(this.db.collection('courses').add(course));
  //         }
  //         return save$.pipe(
  //           map((res: any) => {
  //             return {
  //               id: courseId ?? res.id,
  //               ...course,
  //             };
  //           })
  //         );
  //       })
  //     );
  // }

  createCourse(newCourse: Partial<Course>, courseId?: string) {
    return this.db
      .collection('courses', (ref) => ref.orderBy('seqNo', 'desc').limit(1))
      .get()
      .pipe(
        concatMap((result) => {
          const courses = convertSnaps<Course>(result);

          const lastCourseSeqNo = courses[0]?.seqNo ?? 0;

          const course = {
            ...newCourse,
            seqNo: lastCourseSeqNo + 1,
          };

          let save$: Observable<any>;

          if (courseId) {
            save$ = from(this.db.doc(`courses/${courseId}`).set(course));
          } else {
            save$ = from(this.db.collection('courses').add(course));
          }

          return save$.pipe(
            map((res) => {
              return {
                id: courseId ?? res.id,
                ...course,
              };
            })
          );
        })
      );
  }
}
