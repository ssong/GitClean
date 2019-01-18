// Quick and dirty script to clean up your GitHub repo by batch transfering
// repo ownership to your organisations.

// BEFORE USAGE

// Make sure that you set relevant params below to fit your requirements.

const fetch = require('node-fetch')
const repoList = []

// SETUP

const username = '' // Your github username
const accessToken = '' // Your github access token
const orgName = '' // The organisation name the repos should be transferred to. Create organisation manually first.
const searchTerm = `` // The search term for the repos you want to transfer

// Gets the first 100 repos, may need to run a few times.
const getRepos = () => {
  fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
    method: 'GET',
    headers: {
      Authorization: `token ${accessToken}`
    }
  }).then(res => res.json())
    .then(data => data.map(repo =>
      repo.name.includes(`${searchTerm}`) ? repoList.push(repo.name) : null
    ))
    .then(() => repoList.forEach(repo => moveRepo(repo)))
}

// Used by getRepos to transfer the ownership.
const moveRepo = (repoName) => {
  fetch(`https://api.github.com/repos/${username}/${repoName}/transfer`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.nightshade-preview+json',
      Authorization: `token ${accessToken}`
    },
    body: JSON.stringify({
      new_owner: `${orgName}`
    })
  })
    .then(res => res.json())
    .then(data => console.log(data))
}

// RUN!
getRepos()
