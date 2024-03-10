import { Headline } from '@/components/Headline'
import { P } from '@/components/P'

export default function Imprint() {
  return (
    <>
      <section>
        <Headline type="h2">Imprint</Headline>
        <P>This Website is build as a hobby project by:</P>
        <P>
          <strong>Thomas Rosen</strong>
          <br />
          14473, Potsdam, Germany
        </P>
        <P>
          Email: <a href="hello@thomasrosen.me">hello@thomasrosen.me</a>
        </P>
      </section>
      <section>
        <Headline type="h2">Privacy Policy</Headline>
        <Headline type="h3">Introduction</Headline>
        <P>
          Welcome to Qrowdsourced Answers, a platform for sharing knowledge. This Privacy Policy
          outlines how I collect, use, and share your data. By using the website at
          qa.thomasrosen.me, you agree to the terms described below.
        </P>
        <Headline type="h3">Data Collection and Usage</Headline>
        <P>
          Any information you provide on Qrowdsourced Answers is intended for inclusion in a public
          dataset.
        </P>
        <P>
          The website is hosted on Vercel, which may transmit your data through servers located
          worldwide.
        </P>
        <P>
          The database is stored at neon.tech in Frankfurt, Germany. Your raw data will never be
          published. To ensure privacy and keep storage volume low, all information is
          post-processed, to remove potential privacy concerns and then exported as a dataset. The
          dataset will be available for download in the insights section of the website
        </P>
        <Headline type="h3">Data Anonymisation</Headline>
        <P>
          To enhance your privacy, your answers are grouped under an anonymous identifier. This
          helps to keep the storage volume manageable on Qrowdsourced Answers.
        </P>
        <P>
          You can generate a new anonymous identifier on the “About You“ page. Here, you can also
          view the data associated with your identifier.
        </P>
        <Headline type="h3">Account Information</Headline>
        <P>
          Please note that Qrowdsourced Answers does not require user accounts. While this means
          your data cannot be easily traced back to you, it also means that once your data is
          published in the dataset, it cannot be deleted.
        </P>
        <Headline type="h3">Source Code</Headline>
        <P>
          For transparency, you can review the source code of Qrowdsourced Answers on GitHub (
          <a href="https://github.com/thomasrosen/qa">github.com/thomasrosen/qa</a>
          ).
        </P>
        <Headline type="h3">Contact Information</Headline>
        <P>
          If you have any questions, concerns, or requests regarding your data or this Privacy
          Policy, please do not hesitate to contact me at{' '}
          <a href="hello@thomasrosen.me">hello@thomasrosen.me</a>.
        </P>
        <P>
          Thank you for taking the time to read and understand the privacy practices of Qrowdsourced
          Answers.
        </P>
      </section>
    </>
  )
}
