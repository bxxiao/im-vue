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

export function inviteFriend(friendIds, groupId) {
    return post(
        '/group/invite',
        {groupId, friendIds},
    )
}

/*
* 解散群
* */
export function dissolveGroup(masterUid, groupId) {
    return post(
        '/group/dissolve',
        {masterUid, groupId},
    )
}