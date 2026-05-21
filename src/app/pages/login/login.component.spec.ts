import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Models } from 'appwrite';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockUser: Models.User<Models.Preferences> = {
    $id: '1',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: 'Test User',
    password: '',
    hash: '',
    hashOptions: {},
    registration: new Date().toISOString(),
    status: true,
    passwordUpdate: new Date().toISOString(),
    email: 'test@example.com',
    phone: '',
    emailVerification: true,
    phoneVerification: true,
    prefs: {},
    labels: [],
    mfa: false,
    targets: [],
    accessedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'home', redirectTo: '/', pathMatch: 'full' }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark form as valid with proper data', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should show error for invalid email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();
  });

  it('should disable submit button while loading', fakeAsync(() => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    authService.login.and.returnValue(of(mockUser));
    component.isLoading = true;
    fixture.detectChanges();
    
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();
    expect(submitButton.textContent.trim()).toBe('Signing in...');
    
    component.isLoading = false;
    fixture.detectChanges();
    
    expect(submitButton.disabled).toBeFalse();
    expect(submitButton.textContent.trim()).toBe('Sign in');
  }));

  it('should handle login error', fakeAsync(() => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    const error = { message: 'Invalid credentials' };
    authService.login.and.returnValue(throwError(() => error));

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalledWith('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  }));

  it('should call auth service and navigate on successful login', fakeAsync(() => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    authService.login.and.returnValue(of(mockUser));
    spyOn(router, 'navigate');

    component.loginForm.patchValue(credentials);
    component.onSubmit();
    tick();

    expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(toastr.success).toHaveBeenCalledWith('Successfully logged in!');
    expect(component.isLoading).toBeFalse();
  }));
});
