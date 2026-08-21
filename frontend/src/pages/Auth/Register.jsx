import { useState, useMemo } from "react";
import { Typography, TextField, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Live mismatch check — only shows once the user has actually typed
  // into Confirm Password, so it doesn't flash red before they've started.
  const passwordsMismatch = touchedConfirm && form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const canSubmit = useMemo(
    () => form.name && form.email && form.password && form.confirmPassword && form.password === form.confirmPassword,
    [form]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" mb={0.5}>
        Create your account
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Register to start managing your Docker projects
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField label="Full name" fullWidth required value={form.name} onChange={update("name")} sx={{ mb: 2 }} />
      <TextField label="Email" type="email" fullWidth required value={form.email} onChange={update("email")} sx={{ mb: 2 }} />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        required
        value={form.password}
        onChange={update("password")}
        helperText="At least 8 characters"
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" tabIndex={-1}>
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Confirm password"
        type={showConfirmPassword ? "text" : "password"}
        fullWidth
        required
        value={form.confirmPassword}
        onChange={(e) => {
          setTouchedConfirm(true);
          update("confirmPassword")(e);
        }}
        error={passwordsMismatch}
        helperText={passwordsMismatch ? "Passwords don't match" : " "}
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end" tabIndex={-1}>
                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button type="submit" fullWidth disabled={loading || !canSubmit} sx={{ mt: 2 }}>
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <Typography variant="body2" textAlign="center" mt={2}>
        Already have an account? <Link to="/login">Sign in</Link>
      </Typography>
    </Card>
  );
}
