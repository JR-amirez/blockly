import React, { useEffect, useState } from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import {
  helpCircleOutline,
  checkmarkCircle,
  closeCircle,
} from "ionicons/icons";
import type { Exercise } from "../../hooks/useExercises";
import "./ExercisePanel.css";

interface ExercisePanelProps {
  exercise: Exercise;
  currentIndex: number;
  total: number;
  score: number;
  isCorrect: boolean | null;
  onIncorrectDismissed?: () => void;
}

const ExercisePanel: React.FC<ExercisePanelProps> = ({
  exercise,
  currentIndex,
  total,
  score,
  isCorrect,
  onIncorrectDismissed,
}) => {
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showIncorrectOverlay, setShowIncorrectOverlay] = useState(false);

  useEffect(() => {
    if (isCorrect === false) {
      setShowIncorrectOverlay(true);
      const timer = setTimeout(() => {
        setShowIncorrectOverlay(false);
        onIncorrectDismissed?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
    setShowIncorrectOverlay(false);
  }, [isCorrect, onIncorrectDismissed]);

  useEffect(() => {
    setShowHintModal(false);
    setHintIndex(0);
  }, [exercise.id]);

  const handleShowHint = () => {
    setShowHintModal(true);
  };

  const handleNextHint = () => {
    setHintIndex((prev) => Math.min(prev + 1, exercise.hints.length - 1));
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "basic":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return "#0077b6";
    }
  };

  const getLevelName = (level: string): string => {
    switch (level) {
      case "basic":
        return "Básico";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
    }
  };

  return (
    <div className="exercise-panel">
      <div className="exercise-content">
        <h3 className="exercise-title">{exercise.title}</h3>
        <p className="exercise-description">{exercise.description}</p>

        {isCorrect === true && (
          <div className="exercise-feedback correct">
            <IonIcon icon={checkmarkCircle} />
            <span>{"¡Correcto! +" + exercise.points + " puntos"}</span>
          </div>
        )}
      </div>

      <div className="exercise-actions">
        <button
          className="hint-btn"
          onClick={handleShowHint}
          disabled={exercise.hints.length === 0}
        >
          <IonIcon icon={helpCircleOutline} />
          Ver pista
        </button>
      </div>

      <IonModal
        isOpen={showHintModal}
        onDidDismiss={() => setShowHintModal(false)}
        className="hint-modal"
      >
        <div className="hint-modal-content">
          <div className="hint-modal-header">
            <h3>Pista</h3>
          </div>

          <p className="hint-modal-text">
            {exercise.hints[0] ??
              "No hay pistas disponibles para este ejercicio."}
          </p>

          <div className="hint-modal-actions">
            <IonButton
              shape="round"
              expand="full"
              className="close-hint"
              onClick={() => setShowHintModal(false)}
            >
              Cerrar
            </IonButton>
            {/* <IonButton
              onClick={handleNextHint}
              disabled={exercise.hints.length === 0 || hintIndex >= exercise.hints.length - 1}
            >
              Siguiente pista
            </IonButton> */}
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default ExercisePanel;
