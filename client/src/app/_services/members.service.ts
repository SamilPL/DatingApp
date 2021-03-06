import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginationHeaders, getPaginationResult } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl= environment.apiUrl;
  members: Member[] = [];
  user: User;
  userParams: UserParams;
  memberCache = new Map();

  constructor(
    private http: HttpClient, private accountService: AccountService) {
      this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
        this.user = user;
        this.userParams = new UserParams(user);
      })
    }

  getUserParams() {
    return this.userParams;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  getMembers(userParams: UserParams) {
    /* The idea is that if we dont have a cache we go to the API and get our members 
      but, if we do have cache and the query is identical then we retrieve the members from our cache */
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response)
      return of(response);   

    let params = getPaginationHeaders(userParams.pagenumber, userParams.pageSize);

    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginationResult<Member[]>(this.baseUrl + 'users', params, this.http)
      .pipe(
        map(response => {
          this.memberCache.set(Object.values(userParams).join('-'), response);
          return response;
        })
      );
  }

  getMember(username: string) {
    console.log('SP this.memberCache: ', this.memberCache);
    console.log('SP this.memberCache.values(): ', this.memberCache.values());
    console.log('SP [...this.memberCache.values()]: ', [...this.memberCache.values()]);
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);
    console.log('SP member: ', member);

    if (member) {
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member)
      .pipe(
        map(() => {
          const index = this.members.indexOf(member);
          this.members[index] = member;
        })
      );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber, PageSize) {
    let params = getPaginationHeaders(pageNumber, PageSize);
    params = params.append('predicate', predicate);
    return getPaginationResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
  }
}
