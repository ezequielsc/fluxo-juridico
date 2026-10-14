import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { GitBranch, CheckCircle } from "lucide-react";

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <GitBranch className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <CardDescription>Enviaremos um link de redefinição para seu e-mail</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <p className="text-gray-700">Se o e-mail estiver cadastrado, você receberá o link em instantes.</p>
              <Link to="/login" className="text-primary font-medium hover:underline text-sm">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-danger bg-danger-light rounded-lg" role="alert">
                  {error}
                </div>
              )}
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                disabled={submitting}
              />
              <Button type="submit" className="w-full" loading={submitting}>
                Enviar link
              </Button>
            </form>
          )}
          {!success && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Voltar para o login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
