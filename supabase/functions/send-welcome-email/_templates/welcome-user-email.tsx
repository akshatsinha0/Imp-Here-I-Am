
import {
  Html, Head, Preview, Body, Container, Heading, Text, Link, Img
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  fullName: string;
}

export const WelcomeUserEmail = ({ fullName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome aboard! 🎉 Your journey begins here.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://cdnl.iconscout.com/lottie/premium/thumb/chatbot-3461149-2900057.gif"
          width="96"
          height="96"
          alt="Welcome!"
          style={{ borderRadius: '12px', margin: '0 auto' }}
        />
        <Heading style={heading}>Welcome to TalkWave Together, {fullName || 'friend'}! 👋</Heading>
        <Text style={text}>
          Congratulations on joining TalkWave Together! 🚀<br /><br />
          You're now part of a vibrant, positive, and creative messaging community.
        </Text>
        <Text style={text}>
          <b>Here’s what you can do next:</b><br />
          <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
            <li>💬 Start inspiring conversations</li>
            <li>😎 Discover new friends & communities</li>
            <li>🌈 Share files, emojis, and more!</li>
          </ul>
        </Text>
        <Text style={text}>
          We’re always here to help. If you have questions or feedback, just reply to this email. <br /><br />
          <b>Let’s make something awesome together!</b>
        </Text>
        <Link
          style={button}
          href="https://talkwave-together.com/"
        >
          Launch TalkWave Together 🚀
        </Link>
        <Text style={signature}>
          – The TalkWave Together Team<br />
          <a href="https://talkwave-together.com/" style={{ color: '#6457e3' }}>
            talkwave-together.com
          </a>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeUserEmail;

const main = {
  background: '#fbefff',
};

const container = {
  margin: '40px auto',
  background: '#fff',
  borderRadius: '22px',
  boxShadow: '0 4px 36px #c3a1fc18',
  padding: '44px 28px 32px 28px',
  maxWidth: '380px',
};

const heading = {
  fontSize: '26px',
  color: '#6457e3',
  fontWeight: 800,
  textAlign: 'center' as const,
  margin: '20px 0 18px 0',
  fontFamily: "Inter, Arial, sans-serif"
};

const text = {
  color: '#50446a',
  fontSize: '16px',
  lineHeight: 1.7,
  padding: 0,
  margin: '14px 0',
};

const signature = {
  color: '#6457e3',
  textAlign: 'center' as const,
  marginTop: '32px',
  fontSize: '14px',
};

const button = {
  display: 'block',
  margin: '38px auto 12px auto',
  background: 'linear-gradient(90deg, #59eca6 0%, #5e62e8 100%)',
  color: '#fff',
  textDecoration: 'none',
  padding: '16px 28px',
  borderRadius: '16px',
  fontSize: '18px',
  fontWeight: 700,
  textAlign: 'center' as const,
  letterSpacing: '.4px',
  boxShadow: '0 1px 18px #b997fc33'
};
