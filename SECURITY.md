# Security policy

This repository is the website openbrandexchange.com: static pages, brochures and the public
brand directory. Weaknesses in the specification or in the portal software belong to their own
repositories, but you may report them to the same address.

## Reporting

- E-mail **security@openbrandexchange.com**, or open a [private security advisory](https://github.com/openbrandexchange/website/security/advisories/new).
- **Never** report a vulnerability in a public issue, pull request or discussion.
- Include what is affected (page, file, header or commit), what an attacker can do, the steps
  to reproduce, and whether you want to be credited.
- Test only against your own copy of the site (`npm run build && node tools/serve-dist.mjs`).
  Do not run load tests or scanners against openbrandexchange.com.

Examples of what we want to hear about: a way to run script on the site despite the
Content-Security-Policy, a directory entry that points visitors to a malicious portal, a
brochure or download that could be swapped, or a dependency with a known vulnerability that
ends up in what we publish.

## What happens next

| | Target |
|---|---|
| acknowledgement of your report | within **3 working days** |
| first assessment (valid or not, severity) | within **10 working days** |
| fix or mitigation for a critical or high issue | within **30 days** of the assessment |
| fix for medium and low issues | in the next deploy |

These are the targets of a small volunteer project; we will tell you when we cannot meet one.

## Disclosure

Coordinated disclosure: we publish an advisory once a fix is deployed, at the latest **90 days**
after your report unless we agree otherwise. We credit reporters who want to be named.

## Supported versions

Only what is deployed at https://openbrandexchange.com (the `main` branch). How the site is
protected is described in [docs/security.md](docs/security.md).
