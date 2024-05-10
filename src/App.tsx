import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

interface PostResponse {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Question {
  title: string;
  choices: string[];
}

const TIMER = 30;
const UNLOCK_TIMER = 10;

function QuizApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(TIMER);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response: AxiosResponse<PostResponse[]>) => {
        const quizQuestions = response.data.slice(0, 10).map((q) => ({
          ...q,
          choices: q.body.split("\n").sort(() => Math.random() - 0.5),
        }));
        setQuestions(quizQuestions);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, UNLOCK_TIMER * 1000);

    return () => clearTimeout(timer);
  }, [currentQuestion]);

  useEffect(() => {
    setSecondsLeft(TIMER);

    const timer = setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds <= 0) {
          handleAnswer("-");
          return TIMER;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswer = (answer: string) => {
    setAnswers([...answers, answer]);
    setCurrentQuestion((prev) => prev + 1);
    setIsDisabled(true);
  };

  if (currentQuestion >= questions.length) {
    return (
      <main>
        <h1>Test Results</h1>
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((answer, index) => (
              <tr key={index}>
                <td>{questions[index].title}</td>
                <td>{answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Question {currentQuestion + 1}</h1>
        <h3>
          Time left: <span>{secondsLeft} seconds</span>
        </h3>
      </header>
      <progress max="30" value={secondsLeft}>
        {secondsLeft} seconds
      </progress>
      <h2>{questions[currentQuestion]?.title}?</h2>
      <ul className="questions">
        {questions[currentQuestion]?.choices.map((choice, index) => (
          <li key={index}>
            <button disabled={isDisabled} onClick={() => handleAnswer(choice)}>
              {choice}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default QuizApp;
