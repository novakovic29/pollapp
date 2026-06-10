import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Survey {
  id: string;
  title: string;
  category: string;
  endsIn: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  surveys: Survey[] = [
    { id: '1', title: "Let's Plan the Next Team Event Together", category: 'Team activities', endsIn: 'Ends in 1 Day' },
    { id: '2', title: 'Fit & wellness survey!', category: 'Health & Wellness', endsIn: 'Ends in 2 Days' },
    { id: '3', title: 'Gaming habits and favorite games!', category: 'Gaming & Entertainment', endsIn: 'Ends in 3 Days' }
  ];
}
