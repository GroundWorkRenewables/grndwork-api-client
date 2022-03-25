import json
import os

import pytest
from src_py.grndwork_api_client import config


def describe_get_token():

    refresh_token = {
        'subject': 'uuid',
        'token': 'refresh_token',
    }

    @pytest.fixture(name='openfile', autouse=True)
    def fixture_open(mocker):
        openpatch = mocker.patch(
            target='src_py.grndwork_api_client.config.open',
        )
        file_mock = mocker.MagicMock()
        file_mock.read.return_value = json.dumps(refresh_token)
        openpatch.return_value.__enter__.return_value = file_mock
        return openpatch

    def it_returns_token_if_token_path_is_set(monkeypatch, openfile):
        envs = {
            'GROUNDWORK_TOKEN_PATH': 'GROUNDWORK_TOKEN_PATH',
        }
        monkeypatch.setattr(os, 'environ', envs)
        assert config.get_refresh_token() == refresh_token
        assert openfile.called

    def it_throws_when_only_subject_set(monkeypatch, openfile):
        envs = {
            'GROUNDWORK_SUBJECT': 'SUBJECT',
        }
        monkeypatch.setattr(os, 'environ', envs)
        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()
        assert not openfile.called

    def it_throws_when_only_token_set(monkeypatch, openfile):
        envs = {
            'GROUNDWORK_TOKEN': 'TOKEN',
        }
        monkeypatch.setattr(os, 'environ', envs)
        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()
        assert not openfile.called

    def it_throws_when_none_set(monkeypatch):
        envs = {
            'GROUNDWORK_TOKEN_PATH': None,
            'GROUNDWORK_SUBJECT': None,
            'GROUNDWORK_TOKEN': None,
        }
        monkeypatch.setattr(os, 'environ', envs)

        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            config.get_refresh_token()

    def it_returns_token_when_subject_and_token_set(monkeypatch, openfile):
        envs = {
            'GROUNDWORK_SUBJECT': refresh_token['subject'],
            'GROUNDWORK_TOKEN': refresh_token['token'],
        }
        monkeypatch.setattr(os, 'environ', envs)
        assert config.get_refresh_token() == refresh_token
        assert not openfile.called

    def it_returns_token_using_path_when_all_set(monkeypatch, openfile):
        envs = {
            'GROUNDWORK_TOKEN_PATH': 'test/path',
            'GROUNDWORK_SUBJECT': refresh_token['subject'],
            'GROUNDWORK_TOKEN': refresh_token['token'],
        }
        monkeypatch.setattr(os, 'environ', envs)
        assert config.get_refresh_token() == refresh_token
        assert openfile.called
