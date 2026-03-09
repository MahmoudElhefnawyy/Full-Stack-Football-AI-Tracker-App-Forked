import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Settings: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-32 max-w-4xl animate-fade-in text-white">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    <button className="w-full text-left px-4 py-2 bg-slate-800 border-l-2 border-emerald-500 text-white font-medium rounded-r-lg">Profile</button>
                    <button className="w-full text-left px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors rounded-lg">Notifications</button>
                    <button className="w-full text-left px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors rounded-lg">Billing</button>
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" defaultValue="Mohamed" />
                                <Input label="Last Name" defaultValue="User" />
                            </div>
                            <Input label="Email Address" type="email" defaultValue="mohamed@gmail.com" />
                            <Button className="mt-4">Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Password & Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input label="Current Password" type="password" placeholder="••••••••" />
                            <Input label="New Password" type="password" placeholder="••••••••" />
                            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                            <Button variant="secondary" className="mt-4 border border-slate-700">Update Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
