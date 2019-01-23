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
const forked = false // Set to true if you want to find only forked repos
const option = 'transfer' // Set to either 'delete', 'private', 'public', or 'transfer'

// Gets the first 100 repos, may need to run a few times.
const getRepos = () => {
  fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
    method: 'GET',
    headers: {
      Authorization: `token ${accessToken}`
    }
  }).then(res => res.json())
    .then(data => data.map(repo =>
      (repo.name.includes(`${searchTerm}`)) && (forked ? repo.fork === true : null) ? repoList.push(repo.name) : null
    ))
    .then(() => repoList.forEach(repo => {
      switch (option) {
        case 'transfer':
          moveRepo(repo)
          break
        case 'delete':
          deleteRepo(repo)
          break
        case 'private':
          hideRepo(repo)
          break
        case 'public':
          unhideRepo(repo)
          break
        default:
          console.log('incorrect option selection')
          break
      }
    }))
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
    .then(data => data.message ? console.log(`${repoName}: ${data.message}`) : console.log(`${repoName} transferred`))
}

// Used by getRepos to make the repo private
const hideRepo = (repoName) => {
  fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${accessToken}`
    },
    body: JSON.stringify({
      private: true
    })
  })
    .then(res => res.json())
    .then(data => data.message ? console.log(`${repoName}: ${data.message}`) : console.log(`${repoName} hidden`))
}

// Used by getRepos to make the repo public
const unhideRepo = (repoName) => {
  fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${accessToken}`
    },
    body: JSON.stringify({
      private: false
    })
  })
    .then(res => res.json())
    .then(data => data.message ? console.log(`${repoName}: ${data.message}`) : console.log(`${repoName} unhidden`))
}

// Used by getRepos to delete the repo
const deleteRepo = (repoName) => {
  fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${accessToken}`
    }
  })
    .then(() => console.log(`${repoName} deleted`))
}

// RUN!
getRepos()
