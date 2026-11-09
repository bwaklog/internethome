This repository contains the template and styling source for my website. The content is hosted on a separate repository.

## Setup

```bash
# install the latest release of anna https://github.com/anna-ssg/anna/releases
git clone git@github.com:bwaklog/internethome.git
git submodule update --remote --merge ./site/content/

anna -s
```

## Deployment Setup

The deploy action requires the following repository secrets:
- `SYNAPSE_DEPLOY_KEY`: public key with read access to the synapse repository
- `CLOUDFLARE_API_TOKEN`: an API token with the following permissions
    - Workers Scripts Write (entire account)
    - Workers Routes Write (for the subdomain)
