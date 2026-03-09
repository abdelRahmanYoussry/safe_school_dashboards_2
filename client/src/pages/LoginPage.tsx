import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function LoginPage() {
    const { user, loginMutation } = useAuth();

    const form = useForm({
        resolver: zodResolver(insertUserSchema.pick({ email: true, password: true })),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center pointer-events-none" />

            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x" />

                <CardHeader className="space-y-1 pt-8">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="w-10 h-10 text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">
                        Safe School Hub
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400 text-lg">
                        Administrator Portal
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                <Input
                                                    placeholder="admin@school.com"
                                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-blue-500/50"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-blue-500/50"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all text-white font-semibold text-lg shadow-lg shadow-blue-500/20"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <div className="border-t border-slate-800 p-6 bg-slate-900/80">
                    <p className="text-xs text-center text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
                        Secure multi-tenant infrastructure
                        <br />
                        &copy; 2026 Algoriza Safe School
                    </p>
                </div>
            </Card>
        </div>
    );
}
