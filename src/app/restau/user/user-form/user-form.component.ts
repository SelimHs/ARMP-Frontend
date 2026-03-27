import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  userForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur créé avec succès !';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}