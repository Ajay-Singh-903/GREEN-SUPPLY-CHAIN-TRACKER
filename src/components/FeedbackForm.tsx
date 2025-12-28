import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star, MessageSquare } from 'lucide-react';
import { Feedback, saveFeedback, getFeedbackByShipment } from '../types/feedback';
import { Shipment } from '../types/shipment';
import { User } from '../App';

interface FeedbackFormProps {
  shipment: Shipment;
  user: User;
  onSubmit?: () => void;
}

export function FeedbackForm({ shipment, user, onSubmit }: FeedbackFormProps) {
  const existingFeedback = getFeedbackByShipment(shipment.id);
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState<Feedback['category']>(existingFeedback?.category || 'delivery');
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      shipmentId: shipment.id,
      clientId: user.id,
      clientName: user.name,
      rating,
      comment,
      category,
      createdAt: new Date(),
    };

    saveFeedback(feedback);
    setSubmitted(true);
    onSubmit?.();
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <div className="text-green-600 mb-2">✓</div>
          <p className="text-green-900">Thank you for your feedback!</p>
          <p className="text-green-700">Your rating: {rating} ⭐</p>
          {comment && (
            <p className="text-green-700 mt-2 italic">"{comment}"</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5 text-blue-600" />
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          Help us improve our service and sustainability efforts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>How would you rate this delivery?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Feedback Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Feedback['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Delivery Experience</SelectItem>
                <SelectItem value="packaging">Packaging Quality</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="sustainability">Sustainability Efforts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Your Comments (Optional)</Label>
            <Textarea
              placeholder="Share your experience, suggestions, or concerns..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
