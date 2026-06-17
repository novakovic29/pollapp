import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SurveyComponent } from './survey/survey.component';
import { NewPollComponent } from './create-poll/create-poll.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'survey/:id', component: SurveyComponent },
	{ path: 'create-poll', component: NewPollComponent }
];
