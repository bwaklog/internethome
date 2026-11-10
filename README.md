This repository contains the template and styling source for my website, compatible with anna v5.0.0-rc-1 (breaking change)

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

## Synapse Trigger

This site has its own deployment action on push. The [content repo](https://github.com/bwaklog/synapse) is a sub-module at the `./site/content/` path. The trigger workflow script makes use of the [gh cli](https://cli.github.com/).

Requirements:
- Create a PAT token with permissions: 
    - **Actions** RW ([required](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens?apiVersion=2026-03-10#repository-permissions-for-actions) to trigger action)
    - **Content** RO (resolve `repository.defaultBranchRef` for GraphQL)
    - **Metadata** RO (required and enabled by default)
- Setup repository secret `INTERNETHOME_PAT`
- Setup repository variable `DEPLOY_WORKFLOW_ID`
    ```bash
    # the workflow id for the deploy script
    gh workflow list -R bwaklog/internethome --json id,path \
        -q '.[] | select(.path == ".github/workflows/deploy.yml") | .id'
    ```
Setup the deploy script in `./.github/workflows/<script-name>.yml` in the content repo

```yaml
name: Trigger internethome site deploy 

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Trigger workflow ${{ vars.DEPLOY_WORKFLOW_ID }}
        env:
          GH_TOKEN: ${{ secrets.INTERNETHOME_PAT }}
        run: |
          gh workflow \
            run ${{ vars.DEPLOY_WORKFLOW_ID }} \
            -R bwaklog/internethome

      - name: Wait workflow completion
        env:
          GH_TOKEN: ${{ secrets.INTERNETHOME_PAT }}
        run: |
          RUN_ID=$(
            gh run list -w="${{ vars.DEPLOY_WORKFLOW_ID }}" \
              -R bwaklog/internethome \
              --limit 1 \
              --json databaseId \ -q '.[0].databaseId'
          )
          if [ -z "$RUN_ID" ]; then
            echo "Failed to trigger deploy.yml on bwaklog/internethome"
            exit 1
          fi
          gh run \
            watch "$RUN_ID" \
            -R bwaklog/internethome \
            --compact \
            --exit-status
```
