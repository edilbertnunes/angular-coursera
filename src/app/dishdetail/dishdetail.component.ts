import { Component, OnInit, Input } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    dishfeedbackform: FormGroup;
    dishComment: Comment;
    
    formErrors = {
      'author': '',
      'comment': ''
    };
  
    validationMessages = {
      'author': {
        'required': 'Author Name is required.',
        'minlength': 'Author Name must be at least 2 characters long.'
      },
      'comment': {
        'required': 'Comment is required.',
        'minlength': 'Comment must be at least 5 characters long.'
      }
    };

    constructor(private dishService: DishService,
      private route: ActivatedRoute,
      private location: Location,
      private fb: FormBuilder) { 
        this.createForm();
        this.dishComment = new Comment();
      }
  
    ngOnInit() {
      this.dishService.getDishIds()
        .subscribe(dishIds => this.dishIds = dishIds);
      this.route.params
        .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
        .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }

    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }
  
    goBack(): void {
      this.location.back();
    }

    createForm() {
      this.dishfeedbackform = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2)]],
        rating: 5,
        comment: ['',[ Validators.required, Validators.minLength(5)]] 
      });
  
      this.dishfeedbackform.valueChanges
        .subscribe(data => this.onValueChanged(data));
  
      this.onValueChanged(); // (re)set validation messages now
    }
  
   onValueChanged(data?: any) {
      if (!this.dishfeedbackform) {
        return;
      }
  
      const form = this.dishfeedbackform;
      for (const field in this.formErrors) {
  
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
  
    }

    onSubmit() {
      if (this.dishfeedbackform.value) {
        this.dishComment.author = this.dishfeedbackform.value.author;
        this.dishComment.date = new Date().toISOString();
        this.dishComment.comment = this.dishfeedbackform.value.comment;
        this.dishComment.rating = this.dishfeedbackform.value.rating;
  
        this.dish.comments.push(this.dishComment);
      }
      this.dishfeedbackform.reset({
        author: '',
        rating: 5,
        comment: '',
        date: ''
      });
    }

}