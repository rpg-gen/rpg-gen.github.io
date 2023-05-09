import { useState, useRef, useEffect } from "react";

export default function useTimers() {
    const seconds_to_milliseconds_conversion = 1000;
    const interval_milliseconds = 1000;
    
    const active_timers = useRef({});
    
    function start_new_timer(timer_id, initial_timer_seconds, callback) {
        
        const initial_timer_milliseconds = initial_timer_seconds * seconds_to_milliseconds_conversion;

        const existing_timer = active_timers.current[timer_id];
        
        if (existing_timer != undefined) {
            clearInterval(existing_timer.interval_ref);
        }

        active_timers.current[timer_id] = {
            time_left_milliseconds: initial_timer_milliseconds, 
            callback: callback,
            interval_ref: setInterval(() => {
                const this_timer = active_timers.current[timer_id];
                this_timer.time_left_milliseconds -= interval_milliseconds;
                if (this_timer.time_left_milliseconds <= 0) {
                    clearInterval(this_timer.interval_ref);
                    this_timer.callback();
                }
            }, initial_timer_milliseconds)
        }
    }

    return {
        start_new_timer: start_new_timer,
    }
}