# Install & start

Hymio is self-hostable. The local launcher composes the application backend, Casdoor identity service, and Oath. You can start with text and attachments; a cloud desktop is optional.

## Real case: from sign-in to the first phone reply

On the running deployment, we registered an isolated account in native iOS and requested a two-day packing list. The model returned Chinese content. Signing into Web with the same account then restored that request and reply.

After preparing the services, verify four outcomes: sign in, send, receive a model reply, and recover the same content on another client. A home screen or connected socket alone does not verify the complete path. See the captured [cross-device case](./ios).

## Before you start

Use macOS or Linux with Docker running, Python tooling through [uv](https://docs.astral.sh/uv/), Node.js 22.12 or newer, and pnpm 11. Desktop builds additionally need Rust and platform tools. The launcher is a development workflow, not a production installer.

## Start the Web client

Clone the two repositories beside one another:

```sh
git clone https://github.com/HymioSpace/Oath.git
git clone https://github.com/HymioSpace/Hymio.git
(cd Oath && bash scripts/oath-install)
cd Hymio
bash scripts/hymio-install
hymio init
hymio start --client web --timeout 900
```

If the commands are not on your path, run `uv tool update-shell` and reopen your terminal. Initialization asks for your model credential using hidden input. It saves private configuration in `~/.hymio/config.toml`; do not commit that file.

After startup, register using the Web address printed in the terminal on the machine running the service. This is your application address, not a public service hosted by this documentation site. The first start may download dependencies and build service images. Use `hymio status` and `hymio logs -f` to inspect progress before starting another instance.

## Add a cloud computer when needed

Configure a provider credential privately and designate an administrator using product user IDs. The administrator then grants a registered account cloud-resource access in the separate console. See [devices and administration](./devices).

## Continue on iPhone

The native client connects to a Hymio backend; it does not run Oath or a cloud desktop on the phone. See [Cross-device continuity](./ios) for a real phone-to-computer workflow.

## Deploy publicly

Use HTTPS and the product deployment guide. Identity, provider secrets, data backups and resource permissions belong on the operator's infrastructure, not in this documentation site.

Continue with [Configuration & deployment](./configuration) for private configuration, LAN access and public deployment. Use the [Operator console guide](./admin) to manage user resources.
