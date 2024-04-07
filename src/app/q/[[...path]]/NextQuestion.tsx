import { P } from '@/components/P';
import { QuestionCard } from '@/components/QuestionCard';
import { getQuestion } from '@/lib/getQuestion';
import { getRandomQuestion } from '@/lib/getRandomQuestion';
import { getRandomThing } from '@/lib/getRandomThing';

export default async function NextQuestion({ id }: { id?: string }) {
  let question = null;
  if (id) {
    question = await getQuestion({
      where: {
        question_id: id,
      },
    });
  } else {
    question = await getRandomQuestion();
  }
  let aboutThing = null;

  if (!question) {
    return (
      <P className='text-center'>
        There are no questions available at the moment.
      </P>
    );
  }

  if (question.aboutThingTypes && question.aboutThingTypes.length > 0) {
    aboutThing = await getRandomThing({
      where: {
        type: {
          in: question.aboutThingTypes,
        },
      },
    });

    if (!aboutThing) {
      return (
        <P className='text-center'>
          There are no things to ask questions about at the moment.
        </P>
      );
    }
  }

  return (
    <>
      <section className='flex flex-col gap-4 mb-4 place-content-center'>
        <QuestionCard
          question={question}
          aboutThing={aboutThing ?? undefined}
        />
      </section>

      {/* <hr className='mt-40 my-8' />
      <pre>question = {JSON.stringify(question, null, 2)}</pre>
      <pre>aboutThing = {JSON.stringify(aboutThing, null, 2)}</pre> */}
    </>
  );
}
