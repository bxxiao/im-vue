import {get, post} from './axios/axios';

/*
* members: 群成员id数组
* */
export function createGroup(masterUid, members, groupName) {
    return post(
        '/group/create',
        {masterUid, members, groupName},
    )
}