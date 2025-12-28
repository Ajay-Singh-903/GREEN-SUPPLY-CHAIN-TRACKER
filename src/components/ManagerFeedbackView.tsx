import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { getAllFeedback, getAverageRating } from '../types/feedback';
import { Badge } from './ui/badge';

export function ManagerFeedbackView() {
  const allFeedback = getAllFeedback();
  const avgRating = getAverageRating();

  const categoryColors = {
    delivery: 'bg-blue-100 text-blue-800 border-blue-200',
    packaging: 'bg-purple-100 text-purple-800 border-purple-200',
    communication: 'bg-green-100 text-green-800 border-green-200',
    sustainability: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-600" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">{allFeedback.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Star className="size-5 text-amber-600" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= Math.round(avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-600" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">
              {allFeedback.length > 0
                ? `${((allFeedback.filter(f => f.rating >= 4).length / allFeedback.length) * 100).toFixed(0)}%`
                : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Feedback</CardTitle>
          <CardDescription>
            Reviews and ratings from your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allFeedback.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="size-12 mx-auto mb-4 text-gray-300" />
              <p>No feedback received yet</p>
              <p className="text-gray-400">Client feedback will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-900">{feedback.clientName}</p>
                      <p className="text-gray-600">
                        {feedback.createdAt.toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[feedback.category]}>
                        {feedback.category}
                      </Badge>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-4 ${
                              star <= feedback.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {feedback.comment && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 italic">"{feedback.comment}"</p>
                    </div>
                  )}

                  <div className="mt-3 text-gray-600">
                    Shipment ID: {feedback.shipmentId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
