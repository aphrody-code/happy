declare namespace TwilioPlugin {
    type IncomingMessage = {
    	messageSid: string
    	smsSid?: string
    	accountSid: string
    	messagingServiceSid?: string
    	body: string
    	from: string
    	to: string
    	geo: {
    		from: {
    			country?: string
    			state?: string
    			city?: string
    			zip?: string
    		}
    		to: {
    			country?: string
    			state?: string
    			city?: string
    			zip?: string
    		}
    	}
    	apiVersion: string
    }

    type Events = {
    	sms: (incomingMessage: IncomingMessage) => void
    }
}