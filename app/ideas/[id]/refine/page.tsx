"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Loader2 } from "lucide-react";
import { Idea, RefinementQuestion } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

type WizardStep = 'intro' | 'loading' | 'question' | 'review' | 'submitting' | 'complete';

export default function RefineIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const ideaId = params.id as string;

  const [step, setStep] = useState<WizardStep>('intro');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [questions, setQuestions] = useState<RefinementQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refinedDescription, setRefinedDescription] = useState<string>('');

  // Fetch idea details on mount
  useEffect(() => {
    fetchIdea();
  }, [ideaId]);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch idea');
      }

      const result = await response.json();
      if (result.success) {
        setIdea(result.data);

        // If questions already exist, load them
        if (result.data.refinement_questions && Array.isArray(result.data.refinement_questions)) {
          setQuestions(result.data.refinement_questions);
        }

        // If answers already exist, load them
        if (result.data.refinement_answers) {
          setAnswers(result.data.refinement_answers);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch idea');
      }
    } catch (err) {
      console.error('Error fetching idea:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load idea';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const startRefinement = async () => {
    setStep('loading');
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/refine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const result = await response.json();
      if (result.success) {
        setQuestions(result.data);
        setStep('question');
        setCurrentQuestionIndex(0);
      } else {
        throw new Error(result.error || 'Failed to generate questions');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      toast.error(errorMessage);
      setStep('intro');
    }
  };

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer,
      }));
      setCurrentAnswer('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        // Load existing answer if any
        const nextQuestion = questions[currentQuestionIndex + 1];
        setCurrentAnswer(answers[nextQuestion.id] || '');
      } else {
        setStep('review');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer first
      if (currentAnswer.trim()) {
        const currentQuestion = questions[currentQuestionIndex];
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: currentAnswer,
        }));
      }

      setCurrentQuestionIndex(prev => prev - 1);
      const prevQuestion = questions[currentQuestionIndex - 1];
      setCurrentAnswer(answers[prevQuestion.id] || '');
    }
  };

  const handleEditAnswer = (questionId: string) => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      setCurrentQuestionIndex(questionIndex);
      setCurrentAnswer(answers[questionId] || '');
      setStep('question');
    }
  };

  const submitAnswers = async () => {
    setStep('submitting');
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const result = await response.json();
      if (result.success) {
        setRefinedDescription(result.data.refined_description);
        setStep('complete');
        toast.success('Idea refinement completed successfully!');
      } else {
        throw new Error(result.error || 'Failed to submit answers');
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answers';
      setError(errorMessage);
      toast.error(errorMessage);
      setStep('review');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      problem: 'text-red-400',
      solution: 'text-blue-400',
      market: 'text-green-400',
      feasibility: 'text-yellow-400',
      other: 'text-purple-400',
    };
    return colors[category] || 'text-gray-400';
  };

  const getCategoryBg = (category: string) => {
    const colors: Record<string, string> = {
      problem: 'bg-red-500/10 border-red-500/20',
      solution: 'bg-blue-500/10 border-blue-500/20',
      market: 'bg-green-500/10 border-green-500/20',
      feasibility: 'bg-yellow-500/10 border-yellow-500/20',
      other: 'bg-purple-500/10 border-purple-500/20',
    };
    return colors[category] || 'bg-gray-500/10 border-gray-500/20';
  };

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading idea...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background p-4 pb-24">
      <div className="max-w-3xl mx-auto pt-8">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card hover={false}>
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold text-white">Refine Your Idea</h1>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">{idea.title}</h2>
                  <p className="text-gray-300 text-sm mb-1">Type: {idea.idea_type}</p>
                  {idea.description && (
                    <p className="text-gray-400 mt-4">{idea.description}</p>
                  )}
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2">What is refinement?</h3>
                  <p className="text-gray-300 text-sm">
                    Our AI will ask you 5 thoughtful questions to help you think deeper about your idea.
                    Your answers will be used to create a more detailed and comprehensive description.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/ideas')}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button onClick={startRefinement} className="flex-1">
                    Start Refinement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card hover={false} className="text-center py-12">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h2 className="text-2xl font-bold text-white mb-2">Generating Questions</h2>
                <p className="text-gray-400">Our AI is analyzing your idea and creating personalized questions...</p>
              </Card>
            </motion.div>
          )}

          {/* Question Step */}
          {step === 'question' && questions.length > 0 && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card hover={false}>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className={`text-sm font-semibold ${getCategoryColor(questions[currentQuestionIndex].category)}`}>
                      {questions[currentQuestionIndex].category.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className={`border rounded-xl p-6 mb-6 ${getCategoryBg(questions[currentQuestionIndex].category)}`}>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {questions[currentQuestionIndex].question}
                  </h2>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!currentAnswer.trim()}
                    className="flex-1"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Review Answers' : 'Next Question'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card hover={false}>
                <h1 className="text-3xl font-bold text-white mb-6">Review Your Answers</h1>

                <div className="space-y-4 mb-6">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`border rounded-xl p-4 ${getCategoryBg(question.category)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-400">
                              Q{index + 1}
                            </span>
                            <span className={`text-xs font-semibold ${getCategoryColor(question.category)}`}>
                              {question.category.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-2">{question.question}</p>
                          <p className="text-gray-300 text-sm">{answers[question.id] || 'Not answered'}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditAnswer(question.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStep('question');
                      setCurrentQuestionIndex(questions.length - 1);
                      setCurrentAnswer(answers[questions[questions.length - 1].id] || '');
                    }}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button onClick={submitAnswers} className="flex-1">
                    <Check className="w-5 h-5 mr-2" />
                    Complete Refinement
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Submitting Step */}
          {step === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card hover={false} className="text-center py-12">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h2 className="text-2xl font-bold text-white mb-2">Refining Your Idea</h2>
                <p className="text-gray-400">Our AI is analyzing your answers and creating an improved description...</p>
              </Card>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card hover={false}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Refinement Complete!</h1>
                  <p className="text-gray-400">Your idea has been enhanced with AI-generated insights.</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-6">
                  <h3 className="text-white font-semibold mb-3">Refined Description:</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{refinedDescription}</p>
                </div>

                <Button onClick={() => router.push('/ideas')} className="w-full">
                  View All Ideas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
