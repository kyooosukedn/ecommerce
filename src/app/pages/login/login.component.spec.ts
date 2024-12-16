import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Models } from 'appwrite';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockUser: Models.User<Models.Preferences> = {
    $id: 'test-id',
    $createdAt: 'test-date',
    $updatedAt: 'test-date',
    name: 'Test User',
    password: '',
    hash: '',
    hashOptions: {},
    registration: 'test-date',
    status: true,
    passwordUpdate: 'test-date',
    email: 'test@example.com',
    phone: '',
    emailVerification: true,
    phoneVerification: true,
    prefs: {},
    labels: [],
    mfa: false,
    targets: [],
    accessedAt: ''
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should show validation errors when form is submitted with empty fields', () => {
    // Try to submit empty form
    component.onSubmit();
    fixture.detectChanges();

    // Check form validity
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginForm.get('email')?.errors?.['required']).toBeTruthy();
    expect(component.loginForm.get('password')?.errors?.['required']).toBeTruthy();
  });

  it('should show email validation error for invalid email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    expect(emailControl?.errors?.['email']).toBeTruthy();
    const errorElement = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorElement.nativeElement.textContent).toContain('Please enter a valid email');
  });

  it('should call auth service and navigate on successful login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Setup successful login response
    authService.login.and.returnValue(of(mockUser));
    spyOn(router, 'navigate');

    // Fill form
    component.loginForm.patchValue(credentials);
    
    // Submit form
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(toastr.success).toHaveBeenCalledWith('Successfully logged in!');
    expect(component.isLoading).toBeFalse();
  });

  it('should show error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    const error = new Error(errorMessage);
    authService.login.and.returnValue(throwError(() => error));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith(errorMessage || 'Failed to login. Please try again.');
    expect(component.isLoading).toBeFalse();
  });

  it('should disable submit button while loading', () => {
    // Set valid form values
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    // Mock a delayed response
    authService.login.and.returnValue(of(mockUser));
    
    // Submit form
    component.onSubmit();
    fixture.detectChanges();

    // Get submit button
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    
    // Check if button is disabled and shows loading state
    expect(submitButton.nativeElement.disabled).toBeTrue();
    expect(submitButton.nativeElement.textContent.trim()).toBe('Signing in...');
  });
});
