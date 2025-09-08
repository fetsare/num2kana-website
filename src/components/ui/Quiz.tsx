import { useState, useEffect, type FC, type FormEvent, useRef } from "react";
import { useQuiz } from "../../context/QuizContext";
import { bind, toHiragana, toKatakana } from "wanakana";

import type {
  Question,
  NumberRange,
  QuizMode,
  NumberFormat,
} from "../../types";
import { numToAllFormats } from "num2kana";

// Component for Number to Japanese mode
interface NumToJapProps {
  question: Question;
  numberFormat: NumberFormat;
  onSubmitAnswer: (answer: string) => void;
}

const NumToJapQuestion: FC<NumToJapProps> = ({
  question,
  numberFormat,
  onSubmitAnswer,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      bind(inputRef.current, {
        IMEMode: numberFormat === "hiragana" ? "toHiragana" : "toKatakana",
      });
    }
  }, [inputRef.current]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      onSubmitAnswer(
        numberFormat === "hiragana"
          ? toHiragana(inputRef.current.value)
          : toKatakana(inputRef.current.value)
      );
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <p className="text-base-content text-lg mb-4">
        What is this number in {numberFormat}?
      </p>
      <div className="text-3xl font-bold mb-6 text-secondary">
        {question.number}
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder={`Enter in ${numberFormat}...`}
          className="input text-base-content w-full"
          ref={inputRef}
          autoFocus
        />
        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </>
  );
};

// Component for Japanese to Number mode
interface JapToNumProps {
  question: Question;
  numberFormat: NumberFormat;
  onSubmitAnswer: (answer: string) => void;
}

const JapToNumQuestion: FC<JapToNumProps> = ({
  question,
  numberFormat,
  onSubmitAnswer,
}) => {
  const [answer, setAnswer] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setAnswer("");
      return;
    }
    setAnswer("");
    onSubmitAnswer(answer);
  };

  const getJapaneseRepresentation = () => {
    switch (numberFormat) {
      case "kanji":
        return question.kanji;
      case "hiragana":
        return question.hiragana;
      case "katakana":
        return question.katakana;
      case "romaji":
        return question.romaji;
      default:
        return question.kanji;
    }
  };

  return (
    <>
      <p className="text-base-content text-lg mb-4">What number is this?</p>
      <div className="text-3xl font-bold mb-6 text-secondary">
        {getJapaneseRepresentation()}
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col gap-4"
      >
        <input
          type="number"
          placeholder="Enter the number..."
          className="input w-full validator"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </>
  );
};

// Factory function to render the appropriate question component
const renderQuestionComponent = (
  quizMode: QuizMode,
  question: Question,
  numberFormat: NumberFormat,
  onSubmitAnswer: (answer: string) => void
) => {
  switch (quizMode) {
    case "num-jap":
      return (
        <NumToJapQuestion
          question={question}
          numberFormat={numberFormat}
          onSubmitAnswer={onSubmitAnswer}
        />
      );
    case "jap-num":
      return (
        <JapToNumQuestion
          question={question}
          numberFormat={numberFormat}
          onSubmitAnswer={onSubmitAnswer}
        />
      );
    default:
      return null;
  }
};

const Quiz: FC = () => {
  const { setQuizStarted, quizOptions } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
  const [quizHistory, setQuizHistory] = useState<
    { question: Question; userAnswer: string; isCorrect: boolean }[]
  >([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [lastQuestion, setLastQuestion] = useState<Question | null>(null);

  const [toast, setToast] = useState<{
    showing: boolean;
    success: boolean;
    message: string;
  }>({
    showing: false,
    success: false,
    message: "",
  });

  const generateNewQuestion = (): void => {
    let number: number;

    if (Array.isArray(quizOptions.numbers)) {
      const randomIndex = Math.floor(
        Math.random() * quizOptions.numbers.length
      );
      number = quizOptions.numbers[randomIndex];
    } else {
      const range = quizOptions.numbers as NumberRange;
      number =
        Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
    }
    if (lastQuestion && number === lastQuestion.number) {
      return generateNewQuestion();
    }

    const answers = numToAllFormats(number);
    setCurrentQuestion({
      number,
      kanji: answers.kanji,
      hiragana: answers.hiragana,
      katakana: answers.katakana,
      romaji: answers.romaji,
    });
    setLastQuestion(currentQuestion);
  };

  useEffect(() => {
    generateNewQuestion();
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = (answer: string) => {
    if (!currentQuestion) return;

    let isCorrect = false;
    let correctAnswer = "";

    if (quizOptions.quizMode === "num-jap") {
      switch (quizOptions.numberFormat) {
        case "kanji":
          isCorrect = answer === currentQuestion.kanji;
          correctAnswer = currentQuestion.kanji;
          break;
        case "hiragana":
          isCorrect = answer === currentQuestion.hiragana;
          correctAnswer = currentQuestion.hiragana;
          break;
        case "katakana":
          isCorrect = answer === currentQuestion.katakana;
          correctAnswer = currentQuestion.katakana;
          break;
        case "romaji":
          isCorrect =
            answer.toLowerCase() === currentQuestion.romaji.toLowerCase();
          correctAnswer = currentQuestion.romaji;
          break;
      }
    } else {
      isCorrect = parseInt(answer, 10) === currentQuestion.number;
      correctAnswer = currentQuestion.number.toString();
    }

    setQuizHistory((prev) => [
      ...prev,
      { question: currentQuestion, userAnswer: answer, isCorrect },
    ]);

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    setToast({
      showing: true,
      success: isCorrect,
      message: isCorrect
        ? "Correct!"
        : `Incorrect! The correct answer was ${correctAnswer}`,
    });

    const timeout = setTimeout(() => {
      setToast({ showing: false, success: false, message: "" });
    }, 2000);

    setToastTimeout(timeout);

    if (currentQuestionIndex + 1 >= quizOptions.questionCount) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };
  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

  // Results overlay component
  interface ResultsOverlayProps {
    quizHistory: {
      question: Question;
      userAnswer: string;
      isCorrect: boolean;
    }[];
    onClose: () => void;
  }

  const ResultsOverlay: FC<ResultsOverlayProps> = ({
    quizHistory,
    onClose,
  }) => {
    const correctCount = quizHistory.filter((item) => item.isCorrect).length;
    const totalCount = quizHistory.length;
    const score = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-base-200 rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Quiz Results</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle">
              ✕
            </button>
          </div>

          <div className="stats shadow mb-4 w-full">
            <div className="stat">
              <div className="stat-title">Score</div>
              <div className="stat-value text-primary">{score}%</div>
              <div className="stat-desc">
                {correctCount} of {totalCount} correct
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Number</th>
                  <th>Kanji</th>
                  <th>Hiragana</th>
                  <th>Katakana</th>
                  <th>Romaji</th>
                  <th>Your Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((item, index) => (
                  <tr
                    key={index}
                    className={item.isCorrect ? "text-success" : "text-error"}
                  >
                    <td>{index + 1}</td>
                    <td>{item.question.number}</td>
                    <td>{item.question.kanji}</td>
                    <td>{item.question.hiragana}</td>
                    <td>{item.question.katakana}</td>
                    <td>{item.question.romaji}</td>
                    <td>{item.userAnswer}</td>
                    <td>{item.isCorrect ? "✓" : "✗"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={onClose} className="btn btn-primary">
              Return to Quiz Selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 p-8 text-center min-h-[calc(100vh-300px)]">
      <h2 className="text-2xl font-bold text-base-content">Quiz</h2>
      <progress
        className="progress progress-primary w-full h-5"
        value={currentQuestionIndex}
        max={quizOptions.questionCount}
      ></progress>
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-base-content text-xl font-semibold">
          Question: {currentQuestionIndex + 1}/{quizOptions.questionCount}
        </h2>
        {currentQuestion &&
          renderQuestionComponent(
            quizOptions.quizMode,
            currentQuestion,
            quizOptions.numberFormat,
            handleSubmitAnswer
          )}
      </div>
      <button
        onClick={() => {
          if (currentQuestionIndex >= quizOptions.questionCount) {
            setShowResults(true);
          } else {
            setQuizStarted(false);
          }
        }}
        className="btn btn-secondary mt-6"
      >
        {currentQuestionIndex >= quizOptions.questionCount
          ? "Show Results"
          : "Exit Quiz"}
      </button>
      {toast.showing && (
        <div className="toast toast-end">
          <div
            className={`alert ${
              toast.success ? "alert-success" : "alert-error"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      {showResults && (
        <ResultsOverlay
          quizHistory={quizHistory}
          onClose={() => {
            setShowResults(false);
            setQuizStarted(false);
          }}
        />
      )}
    </div>
  );
};

export default Quiz;
