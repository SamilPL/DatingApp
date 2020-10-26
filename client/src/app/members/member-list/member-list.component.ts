import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/Pagination';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[];
  pagination: Pagination;
  pageNumber = 1;
  pageSize = 5;

  constructor(
    private memberService: MembersService
  ) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.pageNumber, this.pageSize).pipe(
      map(response => {
        this.members = response.result;
        this.pagination = response.pagination;
      })
    ).subscribe();
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.loadMembers();
  }
}
