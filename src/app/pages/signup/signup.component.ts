import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </a>
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="name" class="sr-only">Full Name</label>
              <input id="name" 
                     name="name" 
                     type="text" 
                     formControlName="name"
                     required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                     placeholder="Full Name">
              <div *ngIf="signupForm.get('name')?.touched && signupForm.get('name')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                <div *ngIf="signupForm.get('name')?.errors?.['required']">Full name is required</div>
              </div>
            </div>
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" 
                     name="email" 
                     type="email" 
                     formControlName="email"
                     required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                     placeholder="Email address">
              <div *ngIf="signupForm.get('email')?.touched && signupForm.get('email')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                <div *ngIf="signupForm.get('email')?.errors?.['required']">Email is required</div>
                <div *ngIf="signupForm.get('email')?.errors?.['email']">Please enter a valid email</div>
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" 
                     name="password" 
                     type="password" 
                     formControlName="password"
                     required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                     placeholder="Password">
              <div *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                <div *ngIf="signupForm.get('password')?.errors?.['required']">Password is required</div>
                <div *ngIf="signupForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</div>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" 
                    [disabled]="signupForm.invalid || isLoading"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { name, email, password } = this.signupForm.value;

      this.isLoading = true;
      
      this.authService.register(email, password, name).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // After successful registration, attempt to login
          this.authService.login(email, password).subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success('Account created and logged in successfully!');
              this.router.navigate(['/home']);
            },
            error: (error) => {
              console.error('Login error:', error);
              this.isLoading = false;
              this.toastr.error('Account created but failed to login. Please try logging in manually.');
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          const errorMessage = error?.response?.message || error?.message || 'Failed to create account';
          this.toastr.error(errorMessage);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
