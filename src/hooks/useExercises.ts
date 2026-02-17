import { useState, useCallback, useEffect } from 'react';

export interface FunctionTestCase {
  args: number[];
  expected: number;
}

export interface FunctionExercise {
  functionName: string;
  parameters: string[];
  testCases: FunctionTestCase[];
}

export interface Exercise {
  id: number;
  level: string;
  title: string;
  description: string;
  expectedAnswer: number;
  hints: string[];
  points: number;
  functionTest?: FunctionExercise;
}

interface ExercisesData {
  exercises: Exercise[];
  levels: Record<string, { name: string; color: string; description: string }>;
}

export interface TestResult {
  args: number[];
  expected: number;
  actual: number | undefined;
  passed: boolean;
}

interface UseExercisesReturn {
  currentExercise: Exercise | null;
  exerciseIndex: number;
  totalExercises: number;
  score: number;
  isCorrect: boolean | null;
  checkAnswer: (userAnswer: number | null) => boolean;
  checkFunctionAnswer: (results: TestResult[]) => boolean;
  nextExercise: () => void;
  resetExercises: () => void;
  resetCorrect: () => void;
  getExercisesByLevel: (level: string) => Exercise[];
  loading: boolean;
}

export function useExercises(level: string = 'basic'): UseExercisesReturn {
  const [allExercises, setAllExercises] = useState<ExercisesData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar ejercicios desde JSON
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const response = await fetch('/data/exercises.json');
        const data: ExercisesData = await response.json();
        setAllExercises(data);
      } catch (error) {
        console.error('Error cargando ejercicios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Filtrar por nivel
  useEffect(() => {
    if (allExercises) {
      const filtered = allExercises.exercises.filter((ex) => ex.level === level);
      setExercises(filtered);
      setExerciseIndex(0);
      setScore(0);
      setIsCorrect(null);
    }
  }, [allExercises, level]);

  const currentExercise = exercises[exerciseIndex] || null;

  const checkAnswer = useCallback(
    (userAnswer: number | null): boolean => {
      if (!currentExercise || userAnswer === null) {
        setIsCorrect(false);
        return false;
      }

      const correct = Math.abs(userAnswer - currentExercise.expectedAnswer) < 0.001;
      setIsCorrect(correct);

      if (correct) {
        setScore((prev) => prev + currentExercise.points);
      }

      return correct;
    },
    [currentExercise]
  );

  const checkFunctionAnswer = useCallback(
    (results: TestResult[]): boolean => {
      if (!currentExercise || !currentExercise.functionTest || results.length === 0) {
        setIsCorrect(false);
        return false;
      }

      const allPassed = results.every(r => r.passed);
      setIsCorrect(allPassed);

      if (allPassed) {
        setScore((prev) => prev + currentExercise.points);
      }

      return allPassed;
    },
    [currentExercise]
  );

  const nextExercise = useCallback(() => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
      setIsCorrect(null);
    }
  }, [exerciseIndex, exercises.length]);

  const resetExercises = useCallback(() => {
    setExerciseIndex(0);
    setScore(0);
    setIsCorrect(null);
  }, []);

  const resetCorrect = useCallback(() => {
    setIsCorrect(null);
  }, []);

  const getExercisesByLevel = useCallback(
    (lvl: string): Exercise[] => {
      if (!allExercises) return [];
      return allExercises.exercises.filter((ex) => ex.level === lvl);
    },
    [allExercises]
  );

  return {
    currentExercise,
    exerciseIndex,
    totalExercises: exercises.length,
    score,
    isCorrect,
    checkAnswer,
    checkFunctionAnswer,
    nextExercise,
    resetExercises,
    resetCorrect,
    getExercisesByLevel,
    loading
  };
}
