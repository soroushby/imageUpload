import { Course } from './../interfaces/course';
import { CoursesService } from './../courses.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, concatMap, last, tap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss'],
})
export class AddCourseComponent implements OnInit {
  courseForm: any;
  courseId: string | undefined;
  percentageChanges$: Observable<any> | undefined;
  iconUrl: string | undefined;
  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      data1: ['', Validators.required],
      data2: ['', Validators.required],
      data3: ['', Validators.required],
      seqNo: ['', Validators.required],
    });

    this.courseId = this.db.createId();
  }

  onAddCourses() {
    this.coursesService.addCourses(
      this.courseForm.get('data1').value,
      this.courseForm.get('data2').value,
      this.courseForm.get('data3').value,
      this.courseForm.get('seqNo').value
    );
  }

  uploadThumbnail(event: any) {
    const file: File = event.target.files[0];

    console.log(file.name);

    const filePath = `courses/${this.courseId}/${file.name}`;

    const task = this.storage.upload(filePath, file, {
      cacheControl: 'max-age=2592000,public',
    });

    this.percentageChanges$ = task.percentageChanges();

    task
      .snapshotChanges()
      .pipe(
        last(),
        concatMap(() => this.storage.ref(filePath).getDownloadURL()),
        tap((url) => (this.iconUrl = url)),
        catchError((err) => {
          console.log(err);
          alert('Could not create thumbnail url.');
          return throwError(err);
        })
      )
      .subscribe();
  }

  onCreateCourse() {
    const val = this.courseForm.value;

    const newCourse: Partial<Course> = {
      data1: val.data1,
      data2: val.data2,
      data3: val.data3,
      seqNo: val.seqNo,
    };

    // newCourse.promoStartAt = Timestamp.fromDate(this.form.value.promoStartAt);

    this.coursesService
      .createCourse(newCourse, this.courseId)
      .pipe(
        tap((course) => {
          console.log('Created new course: ', course);
          this.router.navigateByUrl('/welcome');
        }),
        catchError((err) => {
          console.log(err);
          alert('Could not create the course.');
          return throwError(err);
        })
      )
      .subscribe();
  }
}
