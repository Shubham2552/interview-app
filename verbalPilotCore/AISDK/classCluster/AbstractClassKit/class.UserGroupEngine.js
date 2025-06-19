class UserGroupCore {
    constructor(config = {}) {
        this.config = config;
    }

    async addUserToGroup(params) {
        throw new Error('addUserToGroup() must be implemented by subclass');
    }

    async getUserGroups(params) {
        throw new Error('getUserGroups() must be implemented by subclass');
    }
}
module.exports = UserGroupCore;


/*

UserGroupCore -> UG1
    _ParentClass: String
    _ClassName: String
    _Keys: [_FilePath], 
    _Methods: [
    1 Method to add user in a group
    2 Method to delete user from a group ]
*/