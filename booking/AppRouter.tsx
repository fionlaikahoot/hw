import { Route, Switch } from "wouter";
import { useApplication } from "@/contexts/ApplicationContext";
import Home from "@/pages/Home";
import Application from "@/pages/Application";
import NotFound from "@/pages/NotFound";

export default function AppRouter() {
  const { currentUser } = useApplication();

  return (
    <Switch>
      {currentUser ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Application} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}
