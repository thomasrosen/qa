import { TailwindEmail } from '@/components/TailwindEmail'
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
} from '@react-email/components'
import { Options, render } from '@react-email/render'
import { Theme } from 'next-auth'
import { SendVerificationRequestParams } from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'

export async function sendVerificationRequest(
  params: SendVerificationRequestParams
) {
  const { identifier, url, provider, theme } = params
  const { host } = new URL(url)

  const transport = createTransport(provider.server)
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Sign in to ${host}`,
    text: await renderEmail({
      url,
      host,
      theme,
      options: {
        plainText: true,
        htmlToTextOptions: {
          selectors: [{ selector: 'a.button', format: 'skip' }],
        },
      },
    }),
    html: await renderEmail({ url, host, theme, options: { pretty: false } }),
  })
  const failed = result.rejected.concat(result.pending).filter(Boolean)
  if (failed.length) {
    throw new Error(
      `ERROR_zZFjzJlt Email(s) (${failed.join(', ')}) could not be sent`
    )
  }
}

async function renderEmail(params: {
  url: string
  host: string
  theme: Theme
  options: Options
}): Promise<string> {
  return await render(<VerificationRequestEmail {...params} />, params.options)
}

function VerificationRequestEmail({
  host,
  url,
  theme,
}: {
  url: string
  host: string
  theme: Theme
}) {
  const escapedHost = host.replace(/\./g, '&#8203;.') // Insert invisible space into domains from being turned into a hyperlink by email clients like Outlook and Apple mail, as this is confusing because it seems like they are supposed to click on it to sign in.

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="dark only" />
        <meta name="supported-color-schemes" content="dark only" />
      </Head>
      <TailwindEmail>
        <Body className="font-sans-default my-auto mx-auto bg-violet-900 text-violet-50 px-2 antialiased">
          <Preview>Click the button to sign in to {host}</Preview>
          <Container className="rounded-3xl bg-violet-950 text-violet-50 my-[40px] mx-auto p-[20px] max-w-[465px] text-center">
            <h1 className="mb-4">
              Sign in to{' '}
              <strong
                className="whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: escapedHost }}
              />
            </h1>
            <Button
              href={url}
              className="font-bold rounded-2xl px-8 mb-4 py-4 bg-violet-50 text-violet-950"
            >
              Sign In
            </Button>
            <p className="m-0 mb-4">
              Click the button above to sign in to your account.
              <br />
              If you did not request this email you can safely ignore it.
            </p>
            <br />
            <p>
              Here is the link if the button does not work:
              <br />
              <Link href={url} className="underline text-violet-50 break-all">
                {url}
              </Link>
            </p>
          </Container>
        </Body>
      </TailwindEmail>
    </Html>
  )
}
