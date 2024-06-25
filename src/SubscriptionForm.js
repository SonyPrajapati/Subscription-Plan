import React, { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import './style.css';

const SubscriptionForm = () => {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isSubscribed, setIsSubscribed] = useState(selectedPlan === 'free');
  const [question, setQuestion] = useState('');
  const [submittedQuestions, setSubmittedQuestions] = useState({
    free: [],
    silver: [],
    gold: [],
  });
  const [questionsAskedToday, setQuestionsAskedToday] = useState(0);
  const [logMessages, setLogMessages] = useState([]);

  useEffect(() => {
    const questionsAskedTodayFromStorage = localStorage.getItem('questionsAskedToday');
    if (questionsAskedTodayFromStorage !== null) {
      setQuestionsAskedToday(parseInt(questionsAskedTodayFromStorage));
    }

    // Reset the isSubscribed state for free plan users
    setIsSubscribed(selectedPlan === 'free');
  }, [selectedPlan]);

  useEffect(() => {
    localStorage.setItem('questionsAskedToday', questionsAskedToday.toString());
  }, [questionsAskedToday]);

  // Clear submitted question when changing the plan
  useEffect(() => {
    setQuestion('');
  }, [selectedPlan]);

  const addLogMessage = (message) => {
    setLogMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleSubscription = () => {
    console.log('Payment successful!');
    setIsSubscribed(true);

    // Reset the questionsAskedToday count for free plan users
    if (selectedPlan === 'free') {
      setQuestionsAskedToday(0);
    }
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (selectedPlan === 'free' && questionsAskedToday >= 1) {
      addLogMessage('You have reached the daily limit for the Free Plan.');
    } else if ((selectedPlan === 'silver' || selectedPlan === 'gold') && isSubscribed && questionsAskedToday >= (selectedPlan === 'silver' ? 6 : Infinity)) {
      addLogMessage(`You have reached the daily limit for the ${selectedPlan === 'silver' ? 'Silver' : 'Gold'} Plan.`);
    } else {
      setSubmittedQuestions((prevSubmittedQuestions) => ({
        ...prevSubmittedQuestions,
        [selectedPlan]: [...prevSubmittedQuestions[selectedPlan], question],
      }));
      setQuestion('');
      setQuestionsAskedToday(questionsAskedToday + 1);
    }
  };

  const renderQuestionForm = () => {
    if ((isSubscribed && (selectedPlan === 'silver' || selectedPlan === 'gold')) || selectedPlan === 'free') {
      return (
        <div className="question-form">
          <h2>Post a Question</h2>
          <form onSubmit={handleSubmitQuestion}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here"
              rows={6}
              required
            />
            <button type="submit">Submit Question</button>
          </form>
          {submittedQuestions[selectedPlan].length > 0 && (
            <div className="submitted-question">
              <h3>Questions Submitted:</h3>
              {submittedQuestions[selectedPlan].map((q, index) => (
                <p key={index}>{q}</p>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className='not-subscribed-message'>
          <p>You need to subscribe to the Silver or Gold Plan to post questions.</p>
        </div>
      );
    }
  };

  return (
    <div className='subscription-form'>
      <h1>Subscription Form</h1>
      <div className='plan-selection'>
        <h3>Choose a Plan:</h3>
        <div>
          <input
            type="radio"
            id="freePlan"
            value="free"
            checked={selectedPlan === 'free'}
            onChange={() => {
              setSelectedPlan('free');
              setIsSubscribed(true);
            }}
          />
          <label htmlFor="freePlan">Free Plan (Post 1 question per day)</label>
        </div>
        <div>
          <input
            type="radio"
            id="silverPlan"
            value="silver"
            checked={selectedPlan === 'silver'}
            onChange={() => setSelectedPlan('silver')}
          />
          <label htmlFor="silverPlan">Silver Plan (Rs 100/month - Post 5 questions per day)</label>
        </div>
        <div>
          <input
            type="radio"
            id="goldPlan"
            value="gold"
            checked={selectedPlan === 'gold'}
            onChange={() => setSelectedPlan('gold')}
          />
          <label htmlFor="goldPlan">Gold Plan (Rs 1000/month - Post unlimited questions)</label>
        </div>
        {selectedPlan !== 'free' && (
          <StripeCheckout
            stripeKey="pk_test_51NUNmkSIVE6ibfY5JXypSP5v6wpatcyiiLx0wyOjgkgsRKdeISMTn1LSZnVXrX7QbedMMKIOGLXSUWvFqJPFRQ0z00uWIqvrbO"
            token={handleSubscription}
            name="Subscription Plan"
            amount={selectedPlan === 'gold' ? 100000 : selectedPlan === 'silver' ? 10000 : 0}
            currency="INR"
            email=''
            >
              <button className='subscribe-btn'>Subscribe</button>
            </StripeCheckout>
        )}
      </div>
      {isSubscribed && renderQuestionForm()}
      <div className='log-container'>
        <h4>Message:</h4>
        {logMessages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionForm;