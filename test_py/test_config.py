import json

import pytest
from src_py.grndwork_api_client import config


def describe_get_refresh_token():
    refresh_token = {
        'subject': 'uuid',
        'token': 'refresh_token',
    }

    @pytest.fixture(name='openfile', autouse=True)
    def fixture_openfile(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.config.open',
            **{
                'return_value.__enter__.return_value.read.return_value': json.dumps(refresh_token),
            },
        )

    def it_returns_refresh_token_when_token_path_set(monkeypatch, openfile):
        monkeypatch.setenv('GROUNDWORK_TOKEN_PATH', 'GROUNDWORK_TOKEN_PATH')
        monkeypatch.delenv('GROUNDWORK_SUBJECT', False)
        monkeypatch.delenv('GROUNDWORK_TOKEN', False)

        assert config.get_refresh_token() == refresh_token

        assert openfile.call_count == 1

        (args, _) = openfile.call_args

        assert args[0] == 'GROUNDWORK_TOKEN_PATH'

    def it_returns_refresh_token_when_subject_and_token_set(monkeypatch, openfile):
        monkeypatch.delenv('GROUNDWORK_TOKEN_PATH', False)
        monkeypatch.setenv('GROUNDWORK_SUBJECT', refresh_token['subject'])
        monkeypatch.setenv('GROUNDWORK_TOKEN', refresh_token['token'])

        assert config.get_refresh_token() == refresh_token

        assert not openfile.called

    def it_throws_when_only_subject_set(monkeypatch):
        monkeypatch.delenv('GROUNDWORK_TOKEN_PATH', False)
        monkeypatch.setenv('GROUNDWORK_SUBJECT', refresh_token['subject'])
        monkeypatch.delenv('GROUNDWORK_TOKEN', False)

        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()

    def it_throws_when_only_token_set(monkeypatch):
        monkeypatch.delenv('GROUNDWORK_TOKEN_PATH', False)
        monkeypatch.delenv('GROUNDWORK_SUBJECT', False)
        monkeypatch.setenv('GROUNDWORK_TOKEN', refresh_token['token'])

        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()

    def it_throws_when_none_set(monkeypatch):
        monkeypatch.delenv('GROUNDWORK_TOKEN_PATH', False)
        monkeypatch.delenv('GROUNDWORK_SUBJECT', False)
        monkeypatch.delenv('GROUNDWORK_TOKEN', False)

        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()
