import { getCurrentUserName } from './UserService';
import { handleError } from './ErrorService';

const getGithubAvatar = () => {
    return getCurrentUserName()
        .then(getGithubInfo)
        .then(parseResponse)
        .catch(handleError);
};

function getGithubInfo(userName) {
    return fetch(`https://api.github.com/users/${userName}`);
}

function parseResponse(response) {
    return response.json().avatar_url;
}

export default getGithubAvatar;
